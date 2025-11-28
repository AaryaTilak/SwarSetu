pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: sonar-scanner
    image: node:20-buster
    command:
    - cat
    tty: true
    resources:
      limits:
        memory: "2Gi"
        cpu: "1"
      requests:
        memory: "1Gi"
        cpu: "500m"
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
    securityContext:
      runAsUser: 0
    env:
    - name: KUBECONFIG
      value: /kube/config        
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig
  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - name: docker-config
      mountPath: /etc/docker/daemon.json
      subPath: daemon.json
  - name: jnlp
    image: jenkins/inbound-agent:3345.v03dee9b_f88fc-1
    env:
    - name: JENKINS_AGENT_WORKDIR
      value: /home/jenkins/agent
    resources:
      limits:
        memory: "2Gi"
        cpu: "1"
      requests:
        memory: "1Gi"
        cpu: "500m"
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
      readOnly: false
  volumes:
  - name: docker-config
    configMap:
      name: docker-daemon-config
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }
    
    environment {
        // KEEPING YOUR PROJECT NAME
        PROJECT_NAME = '2401202-swarsetu-aaryatilak'
        BACKEND_IMAGE = 'swarsetu-backend'
        FRONTEND_IMAGE = 'swarsetu-frontend'
        // NEXUS_URL is set dynamically below
    }

    stages {
        stage('Initialize') {
            steps {
                container('kubectl') {
                    script {
                        echo "🔎 Finding Nexus Service IP..."
                        // Find the IP and remove extra whitespace
                        env.NEXUS_IP = sh(script: "kubectl get svc --all-namespaces | grep nexus-service-for-docker-hosted-registry | awk '{print \$4}'", returnStdout: true).trim()
                        env.NEXUS_URL = "${env.NEXUS_IP}:8085"
                        echo "✅ Target Nexus URL: ${env.NEXUS_URL}"
                    }
                }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']], 
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [[$class: 'CloneOption', depth: 1, noTags: false, reference: '', shallow: true, timeout: 120]],
                    submoduleCfg: [],
                    userRemoteConfigs: [[url: 'https://github.com/AaryaTilak/SwarSetu.git']]
                ])
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     withCredentials([string(credentialsId: '2401202-Swarsetu', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            npm install -g sonarqube-scanner
                            sonar-scanner \
                                -Dsonar.projectKey=SwarSetu-key \
                                -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/coverage/**,**/server/uploads/**,**/*.mp3,**/*.wav"
                        '''
                    }
                }
            }
        }

        stage('Build & Push') {
            steps {
                container('dind') {
                    sh """
                        # Login
                        docker login ${env.NEXUS_URL} -u admin -p Changeme@2025
                        
                        # Backend
                        docker build -t ${BACKEND_IMAGE}:latest ./server
                        docker tag ${BACKEND_IMAGE}:latest ${env.NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest
                        docker push ${env.NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest

                        # Frontend
                        docker build -t ${FRONTEND_IMAGE}:latest .
                        docker tag ${FRONTEND_IMAGE}:latest ${env.NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                        docker push ${env.NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Deploy SwarSetu') {
            steps {
                container('kubectl') {
                    script {
                        sh """
                            # 1. Namespace & Secrets
                            kubectl get namespace 2401202 || kubectl create namespace 2401202
                            
                            kubectl delete secret nexus-cred -n 2401202 --ignore-not-found
                            kubectl create secret docker-registry nexus-cred \\
                                --docker-server=${env.NEXUS_URL} \\
                                --docker-username=admin \\
                                --docker-password=Changeme@2025 \\
                                -n 2401202

                            kubectl patch serviceaccount default -n 2401202 -p '{"imagePullSecrets": [{"name": "nexus-cred"}]}'

                            # 2. Apply Structure (This sets up the pods with the OLD domain name first)
                            kubectl apply -f k8s/ -n 2401202

                            # 3. THE FIX: Force Update Images to use the IP Address
                            # This overrides the domain name in the YAML files
                            echo "👉 Force-setting images to use IP: ${env.NEXUS_URL}"
                            
                            kubectl set image deployment/backend-deployment backend=${env.NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest -n 2401202
                            kubectl set image deployment/frontend-deployment frontend=${env.NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest -n 2401202

                            # 4. Restart to ensure fresh start
                            kubectl rollout restart deployment/backend-deployment -n 2401202
                            kubectl rollout restart deployment/frontend-deployment -n 2401202
                            
                            # 5. Wait for Success
                            echo "Waiting for Backend..."
                            if ! kubectl rollout status deployment/backend-deployment -n 2401202 --timeout=120s; then
                                echo "❌ BACKEND FAILED. Debug Info:"
                                kubectl get pods -n 2401202
                                kubectl describe pod -l app=backend -n 2401202
                                exit 1
                            fi

                            echo "Waiting for Frontend..."
                            if ! kubectl rollout status deployment/frontend-deployment -n 2401202 --timeout=60s; then
                                echo "❌ FRONTEND FAILED."
                                kubectl describe pod -l app=frontend -n 2401202
                                exit 1
                            fi
                        """
                    }
                }
            }
        }
    }
}
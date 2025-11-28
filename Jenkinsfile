pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  # --- FIX 1: Use a full Node.js image instead of the scanner image ---
  # This fixes the "Error while running Node.js" and bridge server crashes.
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
    # Keep high memory for Git Clone
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
        NEXUS_URL = 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'
        PROJECT_NAME = '2401202-swarsetu-aaryatilak'
        BACKEND_IMAGE = 'swarsetu-backend'
        FRONTEND_IMAGE = 'swarsetu-frontend'
    }

    stages {
        // 1. Checkout Code (With Shallow Clone)
        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']], 
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [
                        [$class: 'CloneOption', depth: 1, noTags: false, reference: '', shallow: true, timeout: 120]
                    ],
                    submoduleCfg: [],
                    userRemoteConfigs: [[url: 'https://github.com/AaryaTilak/SwarSetu.git']]
                ])
            }
        }

        // 2. Code Quality Check (UPDATED)
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     withCredentials([string(credentialsId: '2401202-Swarsetu', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            # 1. Install scanner via npm (since we are in a Node container)
                            npm install -g sonarqube-scanner

                            # 2. Run the scan
                            # Note the exclusion of '**/uploads/**' to prevent analyzing MP3 files
                            sonar-scanner \
                                -Dsonar.projectKey=SwarSetu-key \
                                -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/coverage/**,**/server/uploads/**,**/*.mp3,**/*.wav" \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        '''
                    }
                }
            }
        }

        // 3. Login to Nexus
        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    sh "docker login ${NEXUS_URL} -u admin -p Changeme@2025"
                }
            }
        }

        // 4. Push Images to Nexus
        stage('Tag & Push Images') {
            steps {
                container('dind') {
                    sh '''
                        # --- Handle Backend ---
                        echo "Building Backend..."
                        docker build -t ${BACKEND_IMAGE}:latest ./server
                        docker tag ${BACKEND_IMAGE}:latest ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest
                        docker push ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest

                        # --- Handle Frontend ---
                        echo "Building Frontend..."
                        docker build -t ${FRONTEND_IMAGE}:latest .
                        docker tag ${FRONTEND_IMAGE}:latest ${NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                        docker push ${NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        // 5. Deploy to Kubernetes
        stage('Deploy SwarSetu App') {
            steps {
                container('kubectl') {
                    script {
                        sh 'kubectl get svc --all-namespaces -o wide'
                        sh '''
                            kubectl get namespace 2401202 || kubectl create namespace 2401202

                            # Create Secret for Nexus
                            kubectl delete secret nexus-cred -n 2401202 --ignore-not-found
                            kubectl create secret docker-registry nexus-cred \
                                --docker-server=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                                --docker-username=admin \
                                --docker-password=Changeme@2025 \
                                -n 2401202

                            kubectl patch serviceaccount default -n 2401202 -p '{"imagePullSecrets": [{"name": "nexus-cred"}]}'

                            # Apply Configs
                            kubectl apply -f k8s/ -n 2401202

                            # Restart Deployments
                            kubectl rollout restart deployment/backend-deployment -n 2401202
                            kubectl rollout restart deployment/frontend-deployment -n 2401202
                            
                            # Wait for Rollout
                            echo "Waiting for Backend Deployment..."
                            if ! kubectl rollout status deployment/backend-deployment -n 2401202 --timeout=120s; then
                                echo "❌ BACKEND FAILED. Debug Info:"
                                kubectl get pods -n 2401202
                                kubectl describe pod -l app=backend -n 2401202
                                exit 1
                            fi

                            echo "Waiting for Frontend Deployment..."
                            if ! kubectl rollout status deployment/frontend-deployment -n 2401202 --timeout=60s; then
                                echo "❌ FRONTEND FAILED. Debug Info:"
                                kubectl get pods -n 2401202
                                kubectl describe pod -l app=frontend -n 2401202
                                exit 1
                            fi
                        '''
                    }
                }
            }
        }
    }
}
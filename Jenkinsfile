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
    # Inject the startup command to configure insecure registry dynamically
    command:
    - dockerd
    - --host=unix:///var/run/docker.sock
    - --host=tcp://0.0.0.0:2375
    - --insecure-registry=10.0.0.0/8  # Allow all internal IPs (covers 10.x.x.x)
    # REMOVED conflicting volumeMount for daemon.json
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
  # REMOVED conflicting docker-config volume
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }
    
    environment {
        // Project Specific Variables
        // CHANGED: Use 'docker-hosted' as the repo name based on common Nexus setups
        PROJECT_NAME = '2401202-swarsetu-aarya' 
        BACKEND_IMAGE = 'swarsetu-backend'
        FRONTEND_IMAGE = 'swarsetu-frontend'
        // NEXUS_URL will be discovered dynamically in the first stage
    }

    stages {
        // 1. Initialize & Checkout
        stage('Initialize & Checkout') {
            steps {
                container('kubectl') {
                    script {
                        echo "🔎 Finding Nexus Service IP..."
                        // Dynamically find Nexus IP to solve DNS issues
                        env.NEXUS_IP = sh(script: "kubectl get svc --all-namespaces | grep nexus-service-for-docker-hosted-registry | awk '{print \$4}'", returnStdout: true).trim()
                        
                        if (env.NEXUS_IP == "") {
                            error "❌ Could not find Nexus IP. Check if the service exists."
                        }
                        
                        env.NEXUS_URL = "${env.NEXUS_IP}:8085"
                        echo "✅ Target Nexus URL: ${env.NEXUS_URL}"
                    }
                }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']], 
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [
                        [$class: 'CloneOption', depth: 1, noTags: false, reference: '', shallow: true, timeout: 600]
                    ],
                    submoduleCfg: [],
                    userRemoteConfigs: [[url: 'https://github.com/AaryaTilak/SwarSetu.git']]
                ])
            }
        }

        // 2. Code Quality Check
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     withCredentials([string(credentialsId: '2401202-swarsetu', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            # Install scanner
                            npm install -g sonarqube-scanner

                            # Run scan (Excluding node_modules and large audio files)
                            sonar-scanner \
                                -Dsonar.projectKey=2401202-swarsetu \
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

        // 3. Login to Docker Registry
        stage('Login to Docker') {
            steps {
                container('dind') {
                    sh "docker login ${env.NEXUS_URL} -u admin -p Changeme@2025"
                }
            }
        }

        // 4. Build & Push Images
        stage('Build & Push Images') {
            steps {
                container('dind') {
                    sh """
                        # --- Backend ---
                        echo "Building Backend..."
                        docker build -t ${BACKEND_IMAGE}:latest ./server
                        docker tag ${BACKEND_IMAGE}:latest ${env.NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest
                        docker push ${env.NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest

                        # --- Frontend ---
                        echo "Building Frontend..."
                        docker build -t ${FRONTEND_IMAGE}:latest .
                        docker tag ${FRONTEND_IMAGE}:latest ${env.NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                        docker push ${env.NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
        
        // 5. Deploy to Kubernetes
        stage('Deploy SwarSetu App') {
            steps {
                container('kubectl') {
                    script {
                        sh """
                            # 1. Namespace Setup
                            kubectl get namespace 2401202 || kubectl create namespace 2401202
                            
                            # 2. Secret Setup (Using Dynamic IP)
                            kubectl delete secret nexus-cred -n 2401202 --ignore-not-found
                            kubectl create secret docker-registry nexus-cred \
                                --docker-server=${env.NEXUS_URL} \
                                --docker-username=admin \
                                --docker-password=Changeme@2025 \
                                -n 2401202

                            kubectl patch serviceaccount default -n 2401202 -p '{"imagePullSecrets": [{"name": "nexus-cred"}]}'

                            # 3. Apply Kubernetes Files
                            # Note: We use 'kubectl set image' later, so standard apply is fine
                            kubectl apply -f k8s/ -n 2401202

                            # 4. Force Update Images to use the IP Address
                            # This overrides any placeholder in the YAML files
                            echo "👉 Force-setting images to use IP: ${env.NEXUS_URL}"
                            
                            kubectl set image deployment/backend-deployment backend=${env.NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest -n 2401202
                            kubectl set image deployment/frontend-deployment frontend=${env.NEXUS_URL}/${PROJECT_NAME}/${FRONTEND_IMAGE}:latest -n 2401202

                            # 5. Restart Deployments
                            kubectl rollout restart deployment/backend-deployment -n 2401202
                            kubectl rollout restart deployment/frontend-deployment -n 2401202
                            
                            # 6. Verify Rollout
                            echo "Waiting for Backend..."
                            if ! kubectl rollout status deployment/backend-deployment -n 2401202 --timeout=120s; then
                                echo "❌ BACKEND FAILED. Debug Info:"
                                kubectl logs -l app=backend -n 2401202 --tail=20
                                kubectl describe pod -l app=backend -n 2401202
                                exit 1
                            fi

                            echo "Waiting for Frontend..."
                            if ! kubectl rollout status deployment/frontend-deployment -n 2401202 --timeout=60s; then
                                echo "❌ FRONTEND FAILED. Debug Info:"
                                kubectl get pods -n 2401202
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
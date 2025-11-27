pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command:
    - cat
    tty: true
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
        // Define your Registry URL and Project Name here for easier updates
        NEXUS_URL = 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'
        PROJECT_NAME = '2401202-swarsetu-aaryatilak' // Keep your specific project folder
        BACKEND_IMAGE = 'swarsetu-backend'
        FRONTEND_IMAGE = 'swarsetu-frontend'
    }

    stages {
        // 1. Build the Docker Images
        stage('Build Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        # Wait for Docker daemon
                        sleep 5
                        
                        echo "--- Building Backend Image ---"
                        # Assuming server code is in ./server folder
                        docker build -t ${BACKEND_IMAGE}:latest ./server

                        echo "--- Building Frontend Image ---"
                        # Assuming frontend Dockerfile is in root (based on previous steps)
                        docker build -t ${FRONTEND_IMAGE}:latest .
                        
                        docker image ls
                    '''
                }
            }
        }

        // 2. Code Quality Check
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     // Ensure you use the correct credentials ID from your Jenkins
                     withCredentials([string(credentialsId: '2401202-Swarsetu', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=SwarSetu-key \
                                -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/** \
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
                    // Update username/password if they are different
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
                        docker tag ${BACKEND_IMAGE}:latest ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest
                        docker push ${NEXUS_URL}/${PROJECT_NAME}/${BACKEND_IMAGE}:latest

                        # --- Handle Frontend ---
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
                        sh '''
                            # 1. Ensure Namespace exists
                            kubectl get namespace 2401202 || kubectl create namespace 2401202

                            # 2. Create Nexus Secret in the new Namespace (CRITICAL)
                            # This allows K8s to log in to Nexus to pull your images
                            kubectl delete secret nexus-cred -n 2401202 --ignore-not-found
                            kubectl create secret docker-registry nexus-cred \
                                --docker-server=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                                --docker-username=admin \
                                --docker-password=Changeme@2025 \
                                -n 2401202

                            # 3. Patch ServiceAccount to use this secret automatically
                            # This avoids needing to edit your YAML files manually
                            kubectl patch serviceaccount default -n 2401202 -p '{"imagePullSecrets": [{"name": "nexus-cred"}]}'

                            # 4. Apply Configurations
                            kubectl apply -f k8s/ -n 2401202

                            # 5. Restart Deployments to pick up new images
                            kubectl rollout restart deployment/backend-deployment -n 2401202
                            kubectl rollout restart deployment/frontend-deployment -n 2401202
                            
                            # 6. Wait for Rollout (With Debugging)
                            # If it fails, we print the pod status/logs to see WHY
                            echo "Waiting for Backend Deployment..."
                            if ! kubectl rollout status deployment/backend-deployment -n 2401202 --timeout=60s; then
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
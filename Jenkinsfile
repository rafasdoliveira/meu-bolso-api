pipeline {
  agent any

  environment {
    REGISTRY_IMAGE = 'meu-bolso-api'
    SONAR_PROJECT_KEY = 'meu-bolso-api'
    SONAR_HOST_URL = 'http://sonarqube:9000'
  }

  stages {
    stage('Checkout & Clean') {
      steps {
        cleanWs()
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Tests & Coverage') {
      steps {
        sh 'npm run test:cov'
      }
    }

    stage('SonarQube Scan') {
      environment {
        SONAR_TOKEN = credentials('sonar-token')
      }
      steps {
        withSonarQubeEnv('SONAR_LOCAL') {
          sh '''
        npx sonar-scanner \
          -Dsonar.projectKey=meu-bolso-api \
          -Dsonar.sources=src \
          -Dsonar.tests=src,test \
          -Dsonar.test.inclusions="src/**/*.spec.ts,test/**/*.e2e-spec.ts" \
          -Dsonar.exclusions="src/**/*.spec.ts,src/main.ts,src/migrations/*.ts,src/**/*.dto.ts,src/**/*.entity.ts,src/**/*.module.ts,src/coverage/**/*" \
          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
          -Dsonar.host.url=http://sonarqube:9000 \
          -Dsonar.login=$SONAR_TOKEN
      '''
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Trivy Repo Scan') {
      steps {
        sh '''
          trivy fs \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            --cache-dir /var/jenkins_home/trivy_cache \
            --skip-version-check \
            --scanners vuln \
            .
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          docker build --no-cache -t $REGISTRY_IMAGE:${GIT_COMMIT} .
        '''
      }
    }

    stage('Trivy Image Scan') {
      steps {
        sh '''
          # Vulnerabilidades ignoradas temporariamente via .trivyignore
          # Motivo: Versões seguras já estão no package.json, mas persistem em
          # dependências transitivas que estão sendo tratadas via overrides.
          trivy image --severity HIGH,CRITICAL --exit-code 1 \
            $REGISTRY_IMAGE:${GIT_COMMIT}
        '''
      }
    }

    stage('Create Git Tag') {
      when {
        anyOf {
            branch 'main'
            branch 'configArt'
        }
      }
      steps {
        script {
            echo "Tentando push na branch: ${env.BRANCH_NAME}"
            sh "git checkout ${env.BRANCH_NAME} || git checkout -b ${env.BRANCH_NAME}"
            sh 'git config user.email "jenkins@meubolso.com"'
            sh 'git config user.name "Jenkins CI"'
            sh 'npm version patch -m "chore(release): %s [skip ci]"'
            withCredentials([usernamePassword(credentialsId: 'git-credentials',
                             passwordVariable: 'GIT_PASSWORD',
                             usernameVariable: 'GIT_USERNAME')]) {
                              sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/rafasdoliveira/meu-bolso-api.git ${env.BRANCH_NAME} --tags"
                             }
        }
      }
    }
  }
}

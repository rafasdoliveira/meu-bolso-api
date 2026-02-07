pipeline {
  agent any

  environment {
    REGISTRY_IMAGE = "meu-bolso-api"
    SONAR_PROJECT_KEY = "meu-bolso-api"
    SONAR_HOST_URL = "http://sonarqube:9000"
  }

  stages {

    stage('Checkout') {
      steps {
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
    sh '''
      npx sonar-scanner \
        -Dsonar.projectKey=meu-bolso-api \
        -Dsonar.sources=src \
        -Dsonar.tests=src \
        -Dsonar.test.inclusions="src/**/*.spec.ts" \
        -Dsonar.exclusions="src/**/*.spec.ts" \
        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
        -Dsonar.host.url=http://sonarqube:9000 \
        -Dsonar.login=$SONAR_TOKEN
    '''
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
          trivy fs --severity HIGH,CRITICAL --exit-code 1 .
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          docker build -t $REGISTRY_IMAGE:${GIT_COMMIT} .
        '''
      }
    }

    stage('Trivy Image Scan') {
      steps {
        sh '''
          trivy image --severity HIGH,CRITICAL --exit-code 1 \
            $REGISTRY_IMAGE:${GIT_COMMIT}
        '''
      }
    }

    stage('Create Git Tag') {
      when {
        allOf {
          branch 'main'
          not { changeRequest() }
        }
      }
      steps {
        sh '''
          git config user.name "jenkins"
          git config user.email "jenkins@local"

          TAG="v$(date +%Y%m%d%H%M%S)"
          git tag $TAG
          git push origin $TAG
        '''
      }
    }
  }
}

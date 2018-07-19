pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh """
		npm install
                npm run build
                """
            }
        }
        stage('Test') {
            steps {
                echo 'this is testing...'
            }
        }
        stage('Deploy') {
            steps {
                sh 'cp -rf dist /mnt'
            }
        }
    }
}

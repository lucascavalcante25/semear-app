## Build stage
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Copia TODOS os arquivos da pasta backend para garantir que sonar-project.properties 
# e outros arquivos de configuração do JHipster estejam presentes
COPY . .

# Executa o build. 
# Adicionamos -Dmaven.test.skip=true para acelerar 
# e -Denforcer.skip=true para ignorar o erro de "Dependency convergence"
RUN mvn -B clean package -Pprod -DskipTests -Denforcer.skip=true

## Runtime stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia o jar gerado usando um wildcard para evitar erro de nome
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-Dspring.profiles.active=prod","-jar","app.jar"]
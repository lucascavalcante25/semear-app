## Build stage
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Copia TODOS os arquivos da pasta backend para garantir que sonar-project.properties 
# e outros arquivos de configuração do JHipster estejam presentes
COPY . .

# Executa o build. 
# Adicionamos -Dmaven.test.skip=true para acelerar 
# e -Denforcer.skip=true para ignorar o erro de "Dependency convergence"
RUN mvn -B clean package -Pprod -DskipTests -Denforcer.skip=true -Dmodernizer.skip=true
## Runtime stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia o jar gerado usando um wildcard para evitar erro de nome
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

# Limita a JVM à RAM do container (Render mata com 137 se o heap crescer demais).
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=55.0 -XX:InitialRAMPercentage=15.0 -XX:MaxMetaspaceSize=192m -Xss256k -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=prod -jar app.jar"]
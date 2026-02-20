## Build stage
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Copia apenas o necessário para resolver dependências e build
COPY pom.xml ./
COPY mvnw ./
COPY .mvn ./.mvn

# Baixa dependências (cache de camadas)
RUN chmod +x ./mvnw && ./mvnw -B -q -DskipTests dependency:go-offline

# Agora copia o código-fonte
COPY src ./src

# Build pulando testes, profile prod
RUN ./mvnw -B -DskipTests -Pprod clean package && cp target/*.jar /workspace/app.jar

## Runtime stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /workspace/app.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java","-Dspring.profiles.active=prod","-jar","/app/app.jar"]

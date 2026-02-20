## Build stage
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Copia o pom.xml e a pasta src de uma vez para evitar falhas de repositórios externos
COPY pom.xml ./
COPY src ./src

# Executa o build diretamente. O Maven baixará as dependências durante o package,
# o que ignora o bloqueio rígido do comando go-offline.
RUN mvn -B -DskipTests -Pprod clean package && cp target/*.jar /workspace/app.jar

## Runtime stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia o jar gerado no estágio anterior
COPY --from=build /workspace/app.jar ./app.jar

EXPOSE 8080

# O ENTRYPOINT já define o profile de produção
ENTRYPOINT ["java","-Dspring.profiles.active=prod","-jar","/app/app.jar"]
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY . .
RUN mvn -B -DskipTests -pl supplier-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/supplier-service/target/*.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+AlwaysPreTouch"
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

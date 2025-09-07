FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY . .

RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+AlwaysPreTouch"

EXPOSE 8080

# Run the application
ENTRYPOINT ["java","-jar","/app/app.jar"]

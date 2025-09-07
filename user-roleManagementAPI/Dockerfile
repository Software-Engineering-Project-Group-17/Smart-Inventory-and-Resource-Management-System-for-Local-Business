FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY . .

RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=build /workspace/target/*.jar app.jar

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appuser /app

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+AlwaysPreTouch"

EXPOSE 8084

# Switch to non-root user
USER appuser

# Run the application
ENTRYPOINT ["java","-jar","/app/app.jar"]

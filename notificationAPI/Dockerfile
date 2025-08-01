# Use a lightweight JDK image
FROM eclipse-temurin:21-jdk

# Set the working directory
WORKDIR /app

# Copy Maven build output (the jar file)
COPY target/notificationAPI-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

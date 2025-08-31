# Environment Setup

## Required Environment Variables

Copy `.env.example` to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual database credentials:

```bash
# Database Configuration
DB_HOST=your-neon-host.aws.neon.tech
DB_NAME=neondb
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Admin Configuration
ADMIN_SECRET_KEY=your_admin_secret_key
```

## Running the Application

1. Make sure you have your `.env` file configured
2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

## Security Notes

- Never commit the `.env` file to version control
- The `.env` file is already added to `.gitignore`
- Use `.env.example` as a template for new environments
- In production, use proper secret management services

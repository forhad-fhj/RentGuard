export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    s3Endpoint: process.env.AWS_S3_ENDPOINT,
  },
  
  kafka: {
    broker: process.env.KAFKA_BROKER || 'localhost:9092',
    clientId: process.env.KAFKA_CLIENT_ID || 'rentguard-backend',
    groupId: process.env.KAFKA_GROUP_ID || 'rentguard-consumer-group',
  },
  
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@rentguard.bd',
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  
  payments: {
    bkash: {
      apiKey: process.env.BKASH_API_KEY,
      apiSecret: process.env.BKASH_API_SECRET,
      merchantId: process.env.BKASH_MERCHANT_ID,
    },
    nagad: {
      apiKey: process.env.NAGAD_API_KEY,
      apiSecret: process.env.NAGAD_API_SECRET,
      merchantId: process.env.NAGAD_MERCHANT_ID,
    },
  },
  
  security: {
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'debug',
  },
  
  ai: {
    tesseractDataPath: process.env.TESSERACT_DATA_PATH || './tesseract-data',
    faceRecognitionModelPath: process.env.FACE_RECOGNITION_MODEL_PATH || './models',
    faceMatchThreshold: parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.6,
  },
  
  creditScore: {
    min: parseInt(process.env.CREDIT_SCORE_MIN, 10) || 0,
    max: parseInt(process.env.CREDIT_SCORE_MAX, 10) || 1000,
    default: parseInt(process.env.CREDIT_SCORE_DEFAULT, 10) || 500,
  },
  
  fraud: {
    enabled: process.env.FRAUD_DETECTION_ENABLED === 'true',
    riskThreshold: parseFloat(process.env.FRAUD_RISK_THRESHOLD) || 0.7,
  },
});

import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { redisClient } from '../config/session';

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerification {
  isValid: boolean;
  isBackupCode?: boolean;
}

export class MFAService {
  private static instance: MFAService;
  
  static getInstance(): MFAService {
    if (!MFAService.instance) {
      MFAService.instance = new MFAService();
    }
    return MFAService.instance;
  }
  
  /**
   * Generate MFA setup for a user
   */
  async generateMFASetup(userId: string, email: string): Promise<MFASetup> {
    const secret = speakeasy.generateSecret({
      name: `Fresh County Admin (${email})`,
      issuer: 'Fresh County',
      length: 32
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Store setup temporarily (user hasn't confirmed yet)
    const setupData = {
      secret: secret.base32,
      backupCodes,
      confirmed: false,
      createdAt: new Date().toISOString()
    };
    
    if (redisClient) {
      await redisClient.setex(
        `mfa_setup:${userId}`,
        30 * 60, // 30 minutes
        JSON.stringify(setupData)
      );
    }
    
    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  }
  
  /**
   * Verify MFA setup and enable it for user
   */
  async confirmMFASetup(userId: string, token: string): Promise<boolean> {
    if (!redisClient) return false;
    
    try {
      const setupData = await redisClient.get(`mfa_setup:${userId}`);
      if (!setupData) return false;
      
      const setup = JSON.parse(setupData);
      
      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: setup.secret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time-step tolerance
      });
      
      if (verified) {
        // Save MFA configuration permanently
        await redisClient.set(
          `mfa_config:${userId}`,
          JSON.stringify({
            secret: setup.secret,
            backupCodes: setup.backupCodes,
            enabled: true,
            confirmedAt: new Date().toISOString()
          })
        );
        
        // Clean up temporary setup
        await redisClient.del(`mfa_setup:${userId}`);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error confirming MFA setup:', error);
      return false;
    }
  }
  
  /**
   * Verify MFA token during login
   */
  async verifyMFAToken(userId: string, token: string): Promise<MFAVerification> {
    if (!redisClient) return { isValid: false };
    
    try {
      const configData = await redisClient.get(`mfa_config:${userId}`);
      if (!configData) return { isValid: false };
      
      const config = JSON.parse(configData);
      if (!config.enabled) return { isValid: false };
      
      // First, try TOTP verification
      const totpValid = speakeasy.totp.verify({
        secret: config.secret,
        encoding: 'base32',
        token,
        window: 2
      });
      
      if (totpValid) {
        return { isValid: true };
      }
      
      // If TOTP fails, check backup codes
      if (config.backupCodes && config.backupCodes.includes(token)) {
        // Remove used backup code
        config.backupCodes = config.backupCodes.filter((code: string) => code !== token);
        
        // Update stored config
        await redisClient.set(
          `mfa_config:${userId}`,
          JSON.stringify(config)
        );
        
        return { isValid: true, isBackupCode: true };
      }
      
      return { isValid: false };
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      return { isValid: false };
    }
  }
  
  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    if (!redisClient) return false;
    
    try {
      const configData = await redisClient.get(`mfa_config:${userId}`);
      if (!configData) return false;
      
      const config = JSON.parse(configData);
      return config.enabled === true;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }
  
  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string): Promise<boolean> {
    if (!redisClient) return false;
    
    try {
      await redisClient.del(`mfa_config:${userId}`);
      await redisClient.del(`mfa_setup:${userId}`);
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      return false;
    }
  }
  
  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
  
  /**
   * Generate new backup codes
   */
  async generateNewBackupCodes(userId: string): Promise<string[] | null> {
    if (!redisClient) return null;
    
    try {
      const configData = await redisClient.get(`mfa_config:${userId}`);
      if (!configData) return null;
      
      const config = JSON.parse(configData);
      if (!config.enabled) return null;
      
      const newBackupCodes = this.generateBackupCodes();
      config.backupCodes = newBackupCodes;
      
      await redisClient.set(
        `mfa_config:${userId}`,
        JSON.stringify(config)
      );
      
      return newBackupCodes;
    } catch (error) {
      console.error('Error generating new backup codes:', error);
      return null;
    }
  }
  
  /**
   * Create temporary MFA token for gradual login
   */
  async createMFALoginToken(userId: string): Promise<string | null> {
    if (!redisClient) return null;
    
    try {
      const token = crypto.randomBytes(32).toString('hex');
      
      await redisClient.setex(
        `mfa_login:${token}`,
        10 * 60, // 10 minutes
        JSON.stringify({
          userId,
          createdAt: new Date().toISOString()
        })
      );
      
      return token;
    } catch (error) {
      console.error('Error creating MFA login token:', error);
      return null;
    }
  }
  
  /**
   * Verify and consume MFA login token
   */
  async verifyMFALoginToken(token: string): Promise<string | null> {
    if (!redisClient) return null;
    
    try {
      const data = await redisClient.get(`mfa_login:${token}`);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      // Delete the token (one-time use)
      await redisClient.del(`mfa_login:${token}`);
      
      return parsed.userId;
    } catch (error) {
      console.error('Error verifying MFA login token:', error);
      return null;
    }
  }
}

export const mfaService = MFAService.getInstance();
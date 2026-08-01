export interface FeatureFlags {
  enableAI: boolean;
  enableUPI: boolean;
  enableInvestments: boolean;
  enableNotifications: boolean;
}

export class FeatureFlagsService {
  getFlags(): FeatureFlags {
    return {
      enableAI: process.env.ENABLE_AI === 'true',
      enableUPI: process.env.ENABLE_UPI === 'true',
      enableInvestments: process.env.ENABLE_INVESTMENTS === 'true',
      enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
    };
  }

  isFeatureEnabled(flagName: keyof FeatureFlags): boolean {
    return this.getFlags()[flagName];
  }
}

export const featureFlagsService = new FeatureFlagsService();

import { ProfileData } from "@/types/profile";

class ProfileService {
  private currentProfile: ProfileData | null = null;

  /**
   * Save / submit student profile data
   */
  async createProfile(profile: ProfileData): Promise<ProfileData> {
    // Simulate clean service boundary
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.currentProfile = {
      ...profile,
      id: profile.id || `profile_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const serializableProfile = {
          ...this.currentProfile,
          resume: null, // File objects cannot be JSON stringified
          resumeFileName: profile.resume ? profile.resume.name : profile.resumeFileName,
          resumeFileSize: profile.resume ? profile.resume.size : profile.resumeFileSize,
        };
        localStorage.setItem("careerlens_student_profile", JSON.stringify(serializableProfile));
      } catch {
        // Fallback for restricted storage environments
      }
    }

    return this.currentProfile;
  }

  /**
   * Get currently saved profile
   */
  getProfile(): ProfileData | null {
    if (this.currentProfile) return this.currentProfile;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("careerlens_student_profile");
        if (stored) {
          this.currentProfile = JSON.parse(stored);
          return this.currentProfile;
        }
      } catch {
        // Fallback
      }
    }
    return null;
  }

  /**
   * Clear active profile
   */
  clearProfile(): void {
    this.currentProfile = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("careerlens_student_profile");
      } catch {
        // Fallback
      }
    }
  }
}

export const profileService = new ProfileService();

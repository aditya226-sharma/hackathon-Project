const PRIVACY_KEY = 'runanywhere_privacy_mode';

export function getPrivacyMode(): boolean {
  return localStorage.getItem(PRIVACY_KEY) !== 'false';
}

export function setPrivacyMode(enabled: boolean): void {
  localStorage.setItem(PRIVACY_KEY, enabled.toString());
}

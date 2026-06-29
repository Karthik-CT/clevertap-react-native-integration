// ctLogin.js
import { NativeModules, Platform } from 'react-native';
import CleverTap from 'clevertap-react-native';

const { CTCache } = NativeModules;

export async function ensureCleverTapLogin(contractId) {
  console.log('[CTLogin] called with contractId =', contractId);

  if (!contractId) {
    console.log('[CTLogin] contractId is null/empty -> skipping onUserLogin');
    return;
  }

  let cached = false;
  if (Platform.OS === 'android') {
    try {
      const result = await CTCache.isIdentityCached(contractId);
      console.log('[CTLogin] native result =', JSON.stringify(result));
      console.log('[CTLogin] raw WizRocket value =', result.raw);
      cached = result.cached;
    } catch (e) {
      console.log('[CTLogin] native read error -> fail open:', e.message);
      cached = false;
    }
  }

  if (cached) {
    console.log('[CTLogin] identity already cached -> NOT calling onUserLogin');
    return;
  }

  console.log('[CTLogin] identity NOT cached -> calling onUserLogin with', contractId);
  CleverTap.onUserLogin({ Identity: contractId });
}
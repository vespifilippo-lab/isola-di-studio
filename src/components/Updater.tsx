import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

export default function Updater() {

  useEffect(() => {
    // Check for updates on mount (optional)
    checkForUpdates(false);
  }, []);

  async function checkForUpdates(manual: boolean) {
    try {
      const update = await check();
      
      if (update) {
        console.log(`Update to ${update.version} available!`);
        
        const yes = await ask(
          `A new version (${update.version}) is available. Would you like to install it now?`,
          { title: 'Update Available', kind: 'info' }
        );

        if (yes) {
          await update.downloadAndInstall();
          await message('Update installed successfully. The app will now restart.', { title: 'Update Complete', kind: 'info' });
          await relaunch();
        }
      } else if (manual) {
        await message('You are already on the latest version.', { title: 'No Update', kind: 'info' });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      if (manual) {
        await message(`Failed to check for updates: ${error}`, { title: 'Error', kind: 'error' });
      }
    }
  }

  // This component doesn't render anything itself, but could be extended with a button
  return null;
}

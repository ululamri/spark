const STORAGE_KEY = 'karyra-spark-gateway-state-v1';

export const gatewayState = $state({
  registeredWorkshopIds: [] as string[],
  savedHubResourceIds: [] as string[],
  dismissedBridgeIds: [] as string[],
  lastSavedAt: ''
});

export function toggleWorkshopRegistration(id: string) {
  if (gatewayState.registeredWorkshopIds.includes(id)) {
    gatewayState.registeredWorkshopIds = gatewayState.registeredWorkshopIds.filter((item) => item !== id);
  } else {
    gatewayState.registeredWorkshopIds = [...gatewayState.registeredWorkshopIds, id];
  }
}

export function toggleHubResource(id: string) {
  if (gatewayState.savedHubResourceIds.includes(id)) {
    gatewayState.savedHubResourceIds = gatewayState.savedHubResourceIds.filter((item) => item !== id);
  } else {
    gatewayState.savedHubResourceIds = [...gatewayState.savedHubResourceIds, id];
  }
}

export function dismissBridge(id: string) {
  if (!gatewayState.dismissedBridgeIds.includes(id)) {
    gatewayState.dismissedBridgeIds = [...gatewayState.dismissedBridgeIds, id];
  }
}

export function restoreGatewaySnapshot() {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const snapshot = JSON.parse(raw) as Partial<typeof gatewayState>;

    if (Array.isArray(snapshot.registeredWorkshopIds)) gatewayState.registeredWorkshopIds = snapshot.registeredWorkshopIds;
    if (Array.isArray(snapshot.savedHubResourceIds)) gatewayState.savedHubResourceIds = snapshot.savedHubResourceIds;
    if (Array.isArray(snapshot.dismissedBridgeIds)) gatewayState.dismissedBridgeIds = snapshot.dismissedBridgeIds;
    if (snapshot.lastSavedAt) gatewayState.lastSavedAt = snapshot.lastSavedAt;
  } catch {
    // Ignore corrupted local gateway snapshot.
  }
}

export function saveGatewaySnapshot() {
  if (typeof window === 'undefined') return;

  gatewayState.lastSavedAt = new Date().toISOString();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      registeredWorkshopIds: gatewayState.registeredWorkshopIds,
      savedHubResourceIds: gatewayState.savedHubResourceIds,
      dismissedBridgeIds: gatewayState.dismissedBridgeIds,
      lastSavedAt: gatewayState.lastSavedAt
    })
  );
}

import { apiRequest } from './client';
import { endpoints } from './endpoints';
import type {
  HostPool,
  IdCloudLocation,
  LocatedVm,
  OsImage,
  VirtualMachine,
} from '../types';
import { asArray } from '../utils/format';

export function listLocations() {
  return apiRequest<IdCloudLocation[] | IdCloudLocation>(endpoints.locations).then(asArray);
}

export function listVmImages() {
  return apiRequest<OsImage[] | OsImage>(endpoints.vmImages).then((payload) =>
    asArray(payload)
      .filter((image) => !image.is_app_catalog)
      .map((image) => ({
        os_name: image.os_name,
        display_name: image.display_name,
        ui_position: image.ui_position,
        is_default: image.is_default,
        is_app_catalog: image.is_app_catalog,
        icon: image.icon,
        versions: (image.versions ?? []).filter((version) => version.published),
      }))
      .filter((image) => image.versions.length > 0)
      .sort((a, b) => a.ui_position - b.ui_position),
  );
}

export function listHostPools(locationSlug: string) {
  return apiRequest<HostPool[] | HostPool>(endpoints.hostPools, { locationSlug }).then(asArray);
}

export function listVms(locationSlug: string) {
  return apiRequest<VirtualMachine[] | VirtualMachine>(endpoints.vmList, { locationSlug }).then(asArray);
}

export async function listAllVms(): Promise<LocatedVm[]> {
  const locations = await listLocations();
  const groups = await Promise.all(
    locations.map(async (location) => {
      const vms = await listVms(location.slug);
      return vms.map((vm) => ({
        ...vm,
        locationSlug: location.slug,
        locationName: location.display_name,
      }));
    }),
  );
  return groups.flat().sort((a, b) => a.name.localeCompare(b.name));
}

export function getVm(uuid: string, locationSlug: string) {
  return apiRequest<VirtualMachine>(endpoints.vm, {
    query: { uuid },
    locationSlug,
  });
}

export function startVm(uuid: string, locationSlug: string) {
  return apiRequest<VirtualMachine>(endpoints.vmStart, {
    method: 'POST',
    form: { uuid },
    locationSlug,
  });
}

export function stopVm(uuid: string, locationSlug: string, force = false) {
  return apiRequest<VirtualMachine>(endpoints.vmStop, {
    method: 'POST',
    form: { uuid, force },
    locationSlug,
  });
}

export function createVm(form: Record<string, string | number | boolean>, locationSlug: string) {
  return apiRequest<VirtualMachine>(endpoints.vm, {
    method: 'POST',
    form,
    locationSlug,
  });
}

export function modifyVm(
  form: { uuid: string; name?: string; ram?: number; vcpu?: number },
  locationSlug: string,
) {
  return apiRequest<VirtualMachine>(endpoints.vm, {
    method: 'PATCH',
    form,
    locationSlug,
  });
}

export function deleteVm(uuid: string, locationSlug: string) {
  return apiRequest<unknown>(endpoints.vm, {
    method: 'DELETE',
    form: { uuid },
    locationSlug,
  });
}

export function reinstallVm(uuid: string, locationSlug: string, os_name?: string, os_version?: string) {
  return apiRequest<VirtualMachine>(endpoints.vmReinstall, {
    method: 'POST',
    form: { uuid, os_name, os_version },
    locationSlug,
  });
}

export function changeVmPassword(uuid: string, password: string, username: string, locationSlug: string) {
  return apiRequest<{ success?: boolean }>(endpoints.vmPassword, {
    method: 'PATCH',
    form: { uuid, password, username },
    locationSlug,
  });
}

export function addDisk(uuid: string, size_gb: number, locationSlug: string) {
  return apiRequest<unknown>(endpoints.vmStorage, {
    method: 'POST',
    form: { uuid, size_gb },
    locationSlug,
  });
}

export function modifyDisk(uuid: string, disk_uuid: string, size_gb: number, locationSlug: string) {
  return apiRequest<unknown>(endpoints.vmStorage, {
    method: 'PATCH',
    form: { uuid, disk_uuid, size_gb },
    locationSlug,
  });
}

export function toggleBackup(uuid: string, locationSlug: string) {
  return apiRequest<unknown>(endpoints.vmBackup, {
    method: 'POST',
    form: { uuid },
    locationSlug,
  });
}

export function reservePublicIp(uuid: string, locationSlug: string) {
  return apiRequest<unknown>(endpoints.vmPublicIp, {
    method: 'POST',
    form: { uuid },
    locationSlug,
  });
}

export function releasePublicIp(uuid: string, locationSlug: string) {
  return apiRequest<unknown>(endpoints.vmPublicIp, {
    method: 'DELETE',
    form: { uuid },
    locationSlug,
  });
}

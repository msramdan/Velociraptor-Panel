import { apiRequest } from './client';
import { endpoints } from './endpoints';
import type { IdCloudUser, UserProfile } from '../types';

export function getUserInfo() {
  return apiRequest<IdCloudUser>(endpoints.user);
}

export function updateProfile(form: {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  personal_id_number?: string;
}) {
  return apiRequest<UserProfile>(endpoints.userProfile, {
    method: 'PATCH',
    form,
  });
}

import { describe, it, expect, vi, afterEach } from 'vitest';
import { complaintsApi } from '../../../features/complaints/api';

describe('complaintsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows backend validation details when complaint creation fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Validation failed',
          details: [{ field: 'title', message: 'Title must be between 5 and 100 characters' }],
        }),
      }) as any
    );

    await expect(
      complaintsApi.createComplaint('token', new FormData())
    ).rejects.toThrow('Title must be between 5 and 100 characters');
  });
});

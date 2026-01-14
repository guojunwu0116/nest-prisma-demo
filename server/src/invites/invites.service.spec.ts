import { InvitesService } from './invites.service';
import { ErrorCode } from '../common/constants/error-codes';

const prismaMock = {
  inviteCode: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('InvitesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('consumes invite once and rejects second use', async () => {
    const service = new InvitesService(prismaMock as any);

    prismaMock.inviteCode.findUnique.mockResolvedValueOnce({
      invite_id: 1,
      code: 'ABC',
      used_count: 0,
      max_uses: 1,
      expires_at: null,
    });

    prismaMock.inviteCode.update.mockResolvedValueOnce({
      invite_id: 1,
      code: 'ABC',
      used_count: 1,
    });

    await service.consumeInvite('ABC');

    prismaMock.inviteCode.findUnique.mockResolvedValueOnce({
      invite_id: 1,
      code: 'ABC',
      used_count: 1,
      max_uses: 1,
      expires_at: null,
    });

    await expect(service.consumeInvite('ABC')).rejects.toMatchObject({
      response: { error_code: ErrorCode.INVITE_INVALID_OR_USED },
    });
  });
});

# Server: `ctx.auth.getUserIdentity()` payload example

```json
{
  "branch_id": "main",
  "email": "dean@example.com",
  "email_verified": true,
  "is_anonymous": false,
  "issuer": "https://api.stack-auth.com/api/v1/projects/3a2b00b3-5818-4755-ba5f-1871c260be71",
  "name": "dean",
  "project_id": "3a2b00b3-5818-4755-ba5f-1871c260be71",
  "refresh_token_id": "4b026940-af19-4cdd-994f-b1981c3b15e4",
  "role": "authenticated",
  "selected_team_id": null,
  "subject": "b0773b69-cd1d-4c4a-9826-1ffb88a063b1",
  "tokenIdentifier": "https://api.stack-auth.com/api/v1/projects/3a2b00b3-5818-4755-ba5f-1871c260be71|b0773b69-cd1d-4c4a-9826-1ffb88a063b1"
}
```

# Server: `stackServerApp.getUser(id)` payload example

```js
{
  id: 'b0773b69-cd1d-4c4a-9826-1ffb88a063b1',
  displayName: 'dean',
  primaryEmail: 'dean@example.com',
  primaryEmailVerified: true,
  profileImageUrl: 'https://content.stack-auth.com/user-profile-images/8407ff86-7bc4-4bf1-a8f1-aa540fb98574.jpeg',
  signedUpAt: 2025-10-16T07:18:01.630Z,
  clientMetadata: null,
  clientReadOnlyMetadata: null,
  hasPassword: false,
  emailAuthEnabled: true,
  otpAuthEnabled: true,
  oauthProviders: [],
  passkeyAuthEnabled: true,
  isMultiFactorRequired: false,
  isAnonymous: false,
  toClientJson: [Function: toClientJson],
  lastActiveAt: 2025-10-17T06:25:44.670Z,
  serverMetadata: null,
  setPrimaryEmail: [AsyncFunction: setPrimaryEmail],
  grantPermission: [AsyncFunction: grantPermission],
  revokePermission: [AsyncFunction: revokePermission],
  delete: [AsyncFunction: delete],
  createSession: [AsyncFunction: createSession],
  getActiveSessions: [AsyncFunction: getActiveSessions],
  revokeSession: [AsyncFunction: revokeSession],
  setDisplayName: [AsyncFunction: setDisplayName],
  setClientMetadata: [AsyncFunction: setClientMetadata],
  setClientReadOnlyMetadata: [AsyncFunction: setClientReadOnlyMetadata],
  setServerMetadata: [AsyncFunction: setServerMetadata],
  setSelectedTeam: [AsyncFunction: setSelectedTeam],
  getConnectedAccount: [AsyncFunction: getConnectedAccount],
  selectedTeam: null,
  getTeam: [AsyncFunction: getTeam],
  listTeams: [AsyncFunction: listTeams],
  createTeam: [AsyncFunction: createTeam],
  leaveTeam: [AsyncFunction: leaveTeam],
  listPermissions: [AsyncFunction: listPermissions],
  getPermission: [AsyncFunction: getPermission],
  hasPermission: [AsyncFunction: hasPermission],
  update: [AsyncFunction: update],
  sendVerificationEmail: [AsyncFunction: sendVerificationEmail],
  updatePassword: [AsyncFunction: updatePassword],
  setPassword: [AsyncFunction: setPassword],
  getTeamProfile: [AsyncFunction: getTeamProfile],
  listContactChannels: [AsyncFunction: listContactChannels],
  createContactChannel: [AsyncFunction: createContactChannel],
  listNotificationCategories: [AsyncFunction: listNotificationCategories],
  listApiKeys: [AsyncFunction: listApiKeys],
  createApiKey: [AsyncFunction: createApiKey],
  listOAuthProviders: [AsyncFunction: listOAuthProviders],
  getOAuthProvider: [AsyncFunction: getOAuthProvider],
  getItem: [AsyncFunction: getItem],
  listProducts: [AsyncFunction: listProducts],
  createCheckoutUrl: [AsyncFunction: createCheckoutUrl],
  grantProduct: [AsyncFunction: grantProduct]
}
```

# Server: `stackServerApp.getPartialUser({ from: "convex", ctx })` payload example

- Safe to use in queries/mutations.
- Offers no advantage over `getUserIdentity()`?

```js
{
  id: 'b0773b69-cd1d-4c4a-9826-1ffb88a063b1',
  displayName: 'dean',
  primaryEmail: 'dean@example.com',
  primaryEmailVerified: true,
  isAnonymous: false
}
```

# Client: `useUser()` payload example

```json
{
  "id": "b0773b69-cd1d-4c4a-9826-1ffb88a063b1",
  "displayName": "dean",
  "primaryEmail": "dean@example.com",
  "primaryEmailVerified": true,
  "profileImageUrl": "https://content.stack-auth.com/user-profile-images/8407ff86-7bc4-4bf1-a8f1-aa540fb98574.jpeg",
  "signedUpAt": "2025-10-16T07:18:01.630Z",
  "clientMetadata": null,
  "clientReadOnlyMetadata": {
    "openrouterApiKeySignature": "sk-or-v1-…a61",
    "openrouterApiKeyUpdatedAt": 1760694144592
  },
  "hasPassword": false,
  "emailAuthEnabled": true,
  "otpAuthEnabled": true,
  "oauthProviders": [],
  "passkeyAuthEnabled": true,
  "isMultiFactorRequired": false,
  "isAnonymous": false,
  "_internalSession": {},
  "currentSession": {},
  "selectedTeam": null
}
```

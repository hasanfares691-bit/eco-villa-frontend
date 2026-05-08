# Backend Service Updates - Farms Module

## File Location
`eco-villa-platform/src/modules/farms/farms.service.ts`

## Required Changes

### 1. `listFarmsPublic` Update
```typescript
async listFarmsPublic(filters: any) {
  const farmsList = await db.select().from(farms).where(eq(farms.status, 'active'));
  const farmsWithMedia = await Promise.all(farmsList.map(async (farm) => {
    const media = await db.select().from(farmMedia).where(eq(farmMedia.farm_id, farm.id));
    return { ...farm, media };
  }));
  return farmsWithMedia;
}
```

### 2. `getAvailableFarms` Update
```typescript
async getAvailableFarms() {
  const farmsList = await db.select().from(farms).where(eq(farms.status, 'available'));
  const farmsWithMedia = await Promise.all(farmsList.map(async (farm) => {
    const media = await db.select().from(farmMedia).where(eq(farmMedia.farm_id, farm.id));
    return { ...farm, media };
  }));
  return farmsWithMedia;
}
```

## Prerequisites
Ensure these imports exist:
```typescript
import { db } from "../../../lib/db";
import { farms, farmMedia } from "../../../lib/schema";
import { eq } from "drizzle-orm";
```

## Testing Guidelines
1. Verify media is returned for all farms
2. Confirm proper media-farm association
3. Test with various dataset sizes

## Performance Considerations
- Current implementation uses N+1 queries
- Consider JOIN optimization for large datasets
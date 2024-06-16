import {Block} from '@lib/minecraft';
import {VECTOR3_ONE, Vector3Builder} from '@lib/math';
const bl = Block.MinecraftBlockTypes;
const vec3 = Vector3Builder;

export const hitbox = {
  default: VECTOR3_ONE,
  [bl.Chest]: new vec3(0.975, 0.95, 0.975),
  [bl.Cactus]: new vec3(0.9375, 1, 0.9375),
  [bl.DecoratedPot]: new vec3(0.9375, 1, 0.9375),
  [bl.Anvil]: new vec3(0.875, 1, 1),
};
hitbox
import { Blocks, Vector } from "@lib/minecraft";
import { VECTOR3_ONE } from "@lib/math";
const bl = Blocks.MinecraftBlockTypes;
const vec3 = (x: number, y: number, z: number) => new Vector(x, y, z);

export const hitbox = {
    default: VECTOR3_ONE,
    [bl.Chest]: vec3(0.975, 0.95, 0.975),
    [bl.Cactus]: vec3(0.9375, 1, 0.9375),
    [bl.DecoratedPot]: vec3(0.9375, 1, 0.9375),
    [bl.Anvil]: vec3(0.875, 1, 1),
    [bl.Grindstone]: vec3(0.875, 1, 1),
    [bl.CobbledDeepslateWall]: vec3(0.75, 1.5, 0.75),
    [bl.OakFence]: vec3(0.25, 1.5, 0.25),
    
};

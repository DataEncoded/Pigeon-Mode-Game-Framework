import { EntityCollidable } from "pigeon-mode-game-framework/api/types/EntityCollidable";
import {
  Level,
  Tileset,
  WorldTilesetTile,
} from "pigeon-mode-game-framework/api/types/World";
import { OverlapData } from "pigeon-mode-game-framework/api/types/OverlapData";
import { Rectangle } from "pigeon-mode-game-framework/api/types/Rectangle";
import { rectanglesOverlap } from "pigeon-mode-game-framework/api/functions/rectanglesOverlap";
import { state } from "pigeon-mode-game-framework/api/state";

export const getEntityRectangleOverlapData = (
  entityID: string,
  rectangle: Rectangle,
): OverlapData<string> => {
  if (state.values.world === null) {
    throw new Error(
      "An attempt was made to check rectangle overlap before world was loaded.",
    );
  }
  if (state.values.levelID === null) {
    throw new Error(
      "An attempt was made to check rectangle overlap with no active level.",
    );
  }
  const level: Level | null =
    state.values.world.levels.get(state.values.levelID) ?? null;
  if (level === null) {
    throw new Error(
      "An attempt was made to check rectangle overlap a nonexistant active level.",
    );
  }
  let map: boolean = false;
  const entityCollidables: EntityCollidable<string>[] = [];
  if (
    rectangle.x < 0 ||
    rectangle.y < 0 ||
    rectangle.x + rectangle.width > level.width ||
    rectangle.y + rectangle.height > level.height
  ) {
    map = true;
  }
  for (const layer of level.layers) {
    if (layer.tilesetID !== null) {
      const tileset: Tileset | null =
        state.values.world.tilesets.get(layer.tilesetID) ?? null;
      if (tileset === null) {
        throw Error("An attempt was made to render a nonexistent tileset.");
      }
      for (const layerTile of layer.tiles) {
        const matchedTile: WorldTilesetTile | null =
          tileset.tiles.find(
            (tile: WorldTilesetTile): boolean => layerTile.id === tile.id,
          ) ?? null;
        if (matchedTile !== null && matchedTile.isCollidable) {
          if (
            rectanglesOverlap(rectangle, {
              height: tileset.tileSize,
              width: tileset.tileSize,
              x: layerTile.x,
              y: layerTile.y,
            })
          ) {
            map = true;
          }
        }
      }
    }
    for (const [, entity] of layer.entities) {
      if (
        entity.id !== entityID &&
        entity.position !== null &&
        entity.collisionLayer !== null &&
        rectanglesOverlap(rectangle, {
          height: entity.height,
          width: entity.width,
          x: Math.floor(entity.position.x),
          y: Math.floor(entity.position.y),
        })
      ) {
        entityCollidables.push({
          collisionLayer: entity.collisionLayer,
          entityID: entity.id,
        });
      }
    }
  }
  return {
    entityCollidables,
    map,
  };
};

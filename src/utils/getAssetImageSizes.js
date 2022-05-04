/**
 * Размеры исходной картинки
 * @param scene - Phaser.Scene class
 * @param assetKey - Asset identification
 * @type {{width: number, height: number}}
 */
function getAssetImageSizes(scene, assetKey) {
  return {
    width: scene.textures.get(assetKey).getSourceImage().width,
    height: scene.textures.get(assetKey).getSourceImage().height,
  };
}

export default getAssetImageSizes;

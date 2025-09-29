/**
 * 图片加载工具 - 解决ngrok环境下的OpaqueResponseBlocking问题
 */

/**
 * 使用fetch加载图片并转换为blob URL
 * @param {string} imageUrl - 图片URL
 * @returns {Promise<string>} - 返回blob URL
 */
export const loadImageWithHeaders = async (imageUrl) => {
  try {
    // 如果是本地图片或已经是blob URL，直接返回
    if (!imageUrl || imageUrl.startsWith('blob:') || imageUrl.startsWith('/') || !imageUrl.includes('ngrok')) {
      return imageUrl
    }

    const response = await fetch(imageUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('图片加载失败:', imageUrl, error)
    // 返回默认图片或原URL
    return '/imagines/Background2.jpg'
  }
}

/**
 * 批量加载图片
 * @param {string[]} imageUrls - 图片URL数组
 * @returns {Promise<string[]>} - 返回blob URL数组
 */
export const loadImagesWithHeaders = async (imageUrls) => {
  if (!Array.isArray(imageUrls)) {
    return []
  }

  const promises = imageUrls.map(url => loadImageWithHeaders(url))
  return Promise.all(promises)
}

/**
 * 预加载图片并缓存
 */
const imageCache = new Map()

export const preloadImageWithHeaders = async (imageUrl) => {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)
  }

  try {
    const blobUrl = await loadImageWithHeaders(imageUrl)
    imageCache.set(imageUrl, blobUrl)
    return blobUrl
  } catch (error) {
    console.error('预加载图片失败:', imageUrl, error)
    return '/imagines/Background2.jpg'
  }
}

/**
 * 清理blob URL缓存
 */
export const clearImageCache = () => {
  imageCache.forEach(blobUrl => {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl)
    }
  })
  imageCache.clear()
}
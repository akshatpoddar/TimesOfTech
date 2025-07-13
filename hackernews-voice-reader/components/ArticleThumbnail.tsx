// ArticleThumbnail.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  ImageStyle,
} from 'react-native'

type Props = {
  url: string
  size?: number          // width & height in pixels
  style?: ImageStyle     // any additional styling
}

export default function ArticleThumbnail({
  url,
  size = 80,
  style,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchPreview() {
      try {
        const res = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(url)}`
        )
        const json = await res.json()
        if (!cancelled) {
          // microlink returns data.image.url if it found one
          setImageUrl(json.data?.image?.url ?? null)
        }
      } catch (e) {
        console.warn('Failed to load preview image', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPreview()
    return () => {
      cancelled = true
    }
  }, [url])

  if (loading)
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator />
      </View>
    )

  if (!imageUrl)
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        {/* fallback UI, maybe a placeholder icon */}
      </View>
    )

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[{ width: size, height: size }, style]}
      resizeMode="cover"
    />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
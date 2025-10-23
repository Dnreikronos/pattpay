'use client'

import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import * as pixelArtStyle from '@dicebear/pixel-art'

interface PaymentAvatarProps {
  address: string
  size?: number
}

export function PaymentAvatar({ address, size = 40 }: PaymentAvatarProps) {
  const avatar = useMemo(() => {
    return createAvatar(pixelArtStyle, {
      seed: address,
      size,
    }).toDataUri()
  }, [address, size])

  return (
    <div className="flex-shrink-0">
      <img
        src={avatar}
        alt={`Avatar for ${address}`}
        className="rounded-full border border-border shadow-sm"
        style={{
          imageRendering: 'pixelated',
          width: size,
          height: size
        }}
      />
    </div>
  )
}

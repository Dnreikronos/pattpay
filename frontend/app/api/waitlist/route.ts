import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, referrer, user_agent } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const { data, error } = await supabaseServer
      .from('waitlist')
      .insert([
        {
          email: normalizedEmail,
          referrer: referrer || null,
          user_agent: user_agent || null,
        },
      ])
      .select()

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save email' },
        { status: 500 }
      )
    }

    // Send welcome email via Resend
    try {
      await resend.emails.send({
        from: 'PattPay <onboarding@pattpay.com>', // Change this to your verified domain
        to: normalizedEmail,
        subject: 'Welcome to the PattPay Waitlist!',
        text: `Hey there!

Thanks for joining the PattPay waitlist. You're now part of the future of recurring payments on Solana.

We're building something special — a payment gateway that makes subscriptions and recurring payments simple, transparent, and automated using Solana smart contracts.

What's next?
- We'll keep you updated on our progress
- You'll be among the first to get early access
- We'll share exclusive updates and features

In the meantime, feel free to check out our website to learn more about what we're building: https://pattpay.com

Thanks for being part of this journey!

The PattPay Team

---
Set it once. Let the blockchain do the rest.`,
        html: `
          <h2>Hey there!</h2>

          <p>Thanks for joining the PattPay waitlist. You're now part of the future of recurring payments on Solana.</p>

          <p>We're building something special — a payment gateway that makes subscriptions and recurring payments simple, transparent, and automated using Solana smart contracts.</p>

          <h3>What's next?</h3>
          <ul>
            <li>We'll keep you updated on our progress</li>
            <li>You'll be among the first to get early access</li>
            <li>We'll share exclusive updates and features</li>
          </ul>

          <p>In the meantime, feel free to check out our <a href="https://pattpay.com">website</a> to learn more about what we're building.</p>

          <p>Thanks for being part of this journey!</p>

          <p><strong>The PattPay Team</strong></p>

          <hr />
          <p><em>Set it once. Let the blockchain do the rest.</em></p>
        `,
      })
    } catch (emailError) {
      // Log email error but don't fail the request
      // The user is already on the waitlist
      console.error('Resend error:', emailError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the waitlist',
        data: data?.[0] || null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS (if needed)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

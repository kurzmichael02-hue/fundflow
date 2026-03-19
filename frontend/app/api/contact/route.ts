import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { first_name, last_name, email, category, message } = await req.json()

    if (!first_name || !last_name || !email || !category || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Save to Supabase
    const { error: dbError } = await supabase
      .from("contacts")
      .insert({ first_name, last_name, email, category, message })

    if (dbError) throw new Error(dbError.message)

    // Send email via Resend
    await resend.emails.send({
      from: "FundFlow Contact <onboarding@resend.dev>",
      to: "kurzmichael02@gmail.com",
      subject: `[${category}] New message from ${first_name} ${last_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Name</td><td style="padding: 8px 0; font-size: 13px;">${first_name} ${last_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td><td style="padding: 8px 0; font-size: 13px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Category</td><td style="padding: 8px 0; font-size: 13px;">${category}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">Message</p>
            <p style="font-size: 14px; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'mahima.t@aftershoot.com'

export async function POST(request: Request) {
  try {
    const { csvData, projectName, userEmail } = await request.json()

    if (!csvData || !projectName) {
      return Response.json({ error: 'Missing csvData or projectName' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'Cluster QC Tool <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `Cluster QC Complete — ${projectName}`,
      html: `<p>User <strong>${userEmail || 'unknown'}</strong> has completed QC for project <strong>${projectName}</strong>. Please find the CSV attached.</p>`,
      attachments: [
        {
          filename: `cluster-qc-${projectName.replace(/[^a-z0-9]/gi, '-')}.csv`,
          content: Buffer.from(csvData).toString('base64'),
        },
      ],
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}

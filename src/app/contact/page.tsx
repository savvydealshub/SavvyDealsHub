import { site } from '../../lib/config'

export const metadata = {
  title: `Contact | ${site.name}`,
}

export default function ContactPage() {
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-2xl font-bold">Contact</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Need help, want to suggest a deal, or spotted an issue? Drop us a message.
      </p>

      <div className="card space-y-3">
        <div className="text-sm">
          Email us: <a className="underline" href="mailto:support@savvydealshub.com">support@savvydealshub.com</a>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          (You can change this address later once your domain email is set up.)
        </div>
      </div>
    </div>
  )
}

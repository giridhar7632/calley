import { auth } from '@/lib/auth';
import ShowData from '@/components/ShowData';
import { SignIn, SignOut } from '@/components/Auth';

export default async function Index() {

  const session = await auth()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Excel to Calendar
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Import your events from Excel to Google Calendar in seconds
          </p>
          <p className='italic text-gray-500'>Download the <a className="underline" href="/cally-template.xlsx">template</a> and fill it out</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6 flex flex-col justify-center items-center">
          {session ? <ShowData /> : <SignIn />}
        </div>
        {session && <p className='text-center text-xs text-gray-500 italic'>Signed in as: {session?.user?.email}, <SignOut /></p>}
      </div>
    </div>
  );
}
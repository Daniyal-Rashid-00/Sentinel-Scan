'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=login')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                username: (formData.get('username') as string)?.trim() || null,
            }
        }
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/login?error=signup')
    }

    // If email confirmation is enabled, the user won't have a session yet
    if (authData.session) {
        // User was signed up and logged in immediately (email confirmation disabled)
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    } else {
        // Email confirmation is required - show a success message
        redirect('/login?success=confirm')
    }
}

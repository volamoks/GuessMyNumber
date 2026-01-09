import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export function AuthPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            toast.success('Успешный вход!')
            navigate('/')
        } catch (error: any) {
            toast.error(error.message || 'Ошибка входа')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) throw error
            toast.success('Регистрация успешна! Проверьте почту для подтверждения.')
        } catch (error: any) {
            toast.error(error.message || 'Ошибка регистрации')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Lock className="w-6 h-6 text-primary" />
                        Войти в Product Tools
                    </CardTitle>
                    <CardDescription>
                        Управляйте своими проектами и транскрипциями безопасно.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Вход</TabsTrigger>
                            <TabsTrigger value="register">Регистрация</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Пароль</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Войти
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Пароль</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Зарегистрироваться
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    После регистрации вам придет письмо подтверждения.
                                </p>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground bg-muted/20 pt-6">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Ваши API ключи хранятся ТОЛЬКО на вашем устройстве.</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

import {
  Button, Divider, FormControl, HStack,
  Input, InputGroup, InputRightElement,
  Stack,
  Text, useColorModeValue
} from '@chakra-ui/react';
import {useMemo, useState} from 'react';
import {useRouter} from 'next/router';
import * as crypto from 'crypto';
import {FaTelegramPlane} from "react-icons/fa";
import {useDispatch} from "react-redux";
import { setToken, setUser } from '@/store/user';

const Login = () => {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [telegramPending, setTelegramPending] = useState(false)
  const bg = useColorModeValue('white', 'bg2')
  const fontColor = useColorModeValue('fontColor1', 'fontColor2')
  const dispatch = useDispatch()

  const via = router.query.via || 'WizardingPay'

  const ref = useMemo(() => {
    if (router.query.ref) {
      const ref = router.query.ref as string
      return ref.replace('-', '#')
    }
    return undefined
  }, [router])

  const hashPassword = (password: string) => {
    // add salt and hash 1000 times
    let pwd = password
    for (let i = 0; i < 1000; i++) {
      pwd = crypto.createHash('sha256').update(pwd + process.env.SALT).digest('base64')
    }
    return pwd
  }

  const login = async () => {
    if (username.length === 0 || password.length === 0) {
      return
    }
    setPending(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password: hashPassword(password),
        ref,
      }),
    })
    if (res.status === 200) {
      const {token} = await res.json()
      // set token to store
      dispatch(setToken(token))
      dispatch(setUser(`USER#${username.toLowerCase()}`))
      await router.push({
        pathname: '/chat',
        query: {
          ...router.query,
        }
      })
    } else {
      const {error} = await res.json()
      await router.push({
        pathname: '/auth/error',
        query: {
          ...router.query,
          error,
        }
      })
    }
  }

  const loginWithTelegram = async () => {
    setTelegramPending(true)
    // @ts-ignore
    window?.Telegram.Login.auth({ bot_id: process.env.BOT_TOKEN || '', request_access: 'write', embed: 1 }, async (data) => {
      if (!data) {
        await router.push({
          pathname: '/auth/error',
          query: {
            ...router.query,
            error: 'Telegram login failed'
          }
        })
        return
      }
      const res = await fetch('/api/auth/login/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          ref,
        }),
      })
      if (res.status === 200) {
        const {token} = await res.json()
        // set token to store
        dispatch(setToken(token))
        dispatch(setUser(`TG-USER#${data.id}`))
        await router.push('/chat')
      } else {
        const {error} = await res.json()
        await router.push({
          pathname: '/auth/error',
          query: {
            ...router.query,
            error
          }
        })
      }
    });
  };

  return (
    <Stack h={'full'} w={'full'} bg={bg} justify={'center'} align={'center'} spacing={8} px={2}>
      <Text textAlign={'center'} fontSize={'sm'} fontWeight={'500'} color={fontColor}>
        Welcome to ChatGPT via {via}
      </Text>
      <Stack w={['full', '300px']} spacing={4}>
        <FormControl>
          <InputGroup variant={'outline'}>
            <Input placeholder={'Username'} color={fontColor} value={username}
                   onInput={(e) => {
                     // only allow alphanumeric characters, underscore, and dash, no space, no special characters, no emoji
                     // @ts-ignore
                     e.target.value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '')
                   }}
                   onChange={(e) => setUsername(e.target.value)}/>
          </InputGroup>
        </FormControl>
        <FormControl>
          <InputGroup variant={'outline'}>
            <Input placeholder={'Password'} color={fontColor} type={show ? 'text' : 'password'} value={password}
                   onInput={(e) => {
                      // no space, no chinese characters, no emoji, no full-width symbols
                      // @ts-ignore
                      e.target.value = e.target.value.replace(/[\s\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, '')
                   }}
                   onChange={(e) => setPassword(e.target.value)}/>
            <InputRightElement width='4.5rem'>
              <Button h={'1.75rem'} size={'xs'} color={fontColor} onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button w={['full', '300px']} size={'lg'} color={"white"} bg={'#10A37F'} onClick={login} isLoading={pending}>
          Continue
        </Button>
        <HStack alignSelf={"center"} fontSize={'xs'} fontWeight={'500'}>
          <Text color={fontColor}>Don&apos;t have an account?</Text>
          <Text cursor={'pointer'} onClick={() => {
            router.push({
              pathname: '/auth/signup',
              query: {
                ...router.query,
              }
            })
          }} style={{ color: '#10A37F' }}>Sign up</Text>
        </HStack>
        {
          via === 'WizardingPay' && (
            <>
              <HStack>
                <Divider/>
                <Text fontSize={'xx-small'} color={fontColor}>OR</Text>
                <Divider/>
              </HStack>
              <Button w={['full', '300px']} px={3} gap={1} size={'lg'} justifyContent={"start"} isLoading={telegramPending}
                      leftIcon={<FaTelegramPlane fontSize={'20px'}/>} variant={'outline'} borderColor={'fontColor2'}
                      color={fontColor} onClick={loginWithTelegram}>
                Continue with Telegram
              </Button>
            </>
          )
        }
      </Stack>
    </Stack>
  )
}

export default Login
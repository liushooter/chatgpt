import {
  Box,
  Button,
  Spacer,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import {FiLogOut, FiPlus, FiTrash2} from "react-icons/fi";
import {IoChatboxOutline, IoWalletOutline} from "react-icons/io5";
import {RiVipCrown2Line} from "react-icons/ri";
import {MoonIcon, SunIcon} from "@chakra-ui/icons";
import {setToken, setUser} from "@/store/user/authSlice";
import CoinsModalAndDrawer from "@/components/CoinsModalAndDrawer";
import PassModalAndDrawer from "@/components/PassModalAndDrawer";
import {useRouter} from "next/router";
import {useDispatch, useSelector} from "react-redux";
import {useCallback, useEffect, useState} from "react";

const Menu = () => {
  const {colorMode, toggleColorMode} = useColorMode()
  const router = useRouter()
  const {isOpen: isOpenCoins, onOpen: onOpenCoins, onClose: onCloseCoins} = useDisclosure()
  const {isOpen: isOpenPass, onOpen: onOpenPass, onClose: onClosePass} = useDisclosure()
  const dispatch = useDispatch();
  const jwt = useSelector((state: any) => state.auth.token);
  const [conversation, setConversation] = useState([])

  const clearConversationList = async () => {
    const response = await fetch('/api/conversation', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          ids: conversation.map((c: any) => c.id),
        })
      }
    );
    if (!response.ok) {
      return
    }
    await getConversationList()
  }

  // only run once
  const getConversationList = useCallback(async () => {
    const response = await fetch('/api/conversation', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await response.json();
    setConversation(data.items || []);
  }, [jwt]);

  useEffect(() => {
    getConversationList()
  }, [getConversationList])

  return (
    <Stack h={'full'} p={2} spacing={2} bg={'bg1'} minW={'260px'} w={['full', 'full', '260px']}>
      <Button variant={'outline'} boxShadow={'md'} minH={'46px'} borderColor={'whiteAlpha.400'} _hover={{bg: 'bg3'}}
              leftIcon={<FiPlus color={'white'}/>} justifyContent={"start"} gap={1} color={"white"}
              onClick={() => {
                router.push({
                  pathname: `/chat`,
                })
              }}>
        New chat
      </Button>
      <Stack pt={2} h={'full'} overflow={"scroll"}>
        {conversation.map((item: any) => (
          <Button key={item.id} variant={'ghost'} leftIcon={<IoChatboxOutline color={'white'}/>} gap={1}
                  _hover={{bg: 'bg3'}}
                  onClick={() => {
                    router.push({
                      pathname: `/chat/${item.id.split('#').pop()}`,
                    })
                  }}
          >
            <Text color={'gray.50'} textAlign={'start'} w={'full'} overflow={'hidden'} textOverflow={'ellipsis'}
                  whiteSpace={'nowrap'} fontSize={'sm'}>
              {item.title}
            </Text>
          </Button>
        ))}
      </Stack>
      <Spacer/>
      <Stack spacing={1}>
        <Box w={'full'} h={'1px'} bg={'whiteAlpha.400'}/>
        <Button variant={'ghost'} leftIcon={<FiTrash2 color={'white'}/>} gap={1} justifyContent={"start"}
                color={'white'} _hover={{bg: 'bg3'}} onClick={clearConversationList}>
          Clear conversations
        </Button>
        <Button variant={'ghost'} leftIcon={<IoWalletOutline color={'white'}/>} _hover={{bg: 'bg3'}} gap={1}
                justifyContent={"start"}
                onClick={onOpenCoins}>
          <Stack align={"start"} spacing={0}>
            <Text color={'white'} textAlign={'start'} w={'full'} overflow={'hidden'} textOverflow={'ellipsis'}
                  pr={'2px'}>
              Balance
            </Text>
            <Text color={'white'} textAlign={'end'} fontSize={'xx-small'}>
              {(1000).toLocaleString()} Coins
            </Text>
          </Stack>
        </Button>
        <CoinsModalAndDrawer isOpen={isOpenCoins} onClose={onCloseCoins}/>
        <Button variant={'ghost'} leftIcon={<RiVipCrown2Line color={'gold'}/>} _hover={{bg: 'bg3'}} gap={1}
                justifyContent={"start"} onClick={onOpenPass}>
          <Stack align={"start"} spacing={0}>
            <Text color={'white'} textAlign={'start'} w={'full'} overflow={'hidden'} textOverflow={'ellipsis'}
                  pr={'2px'}>
              Priority Pass
            </Text>
            <Text color={'white'} textAlign={'end'} fontSize={'xx-small'}>
              {(3650).toLocaleString()} Days
            </Text>
          </Stack>
        </Button>
        <PassModalAndDrawer isOpen={isOpenPass} onClose={onClosePass}/>
        <Button variant={'ghost'} gap={1} justifyContent={'start'} color={"white"}
                leftIcon={colorMode === 'light' ? <MoonIcon color={'white'}/> : <SunIcon color={'white'}/>}
                _hover={{bg: 'bg3'}} onClick={toggleColorMode}>
          {colorMode === 'light' ? 'Dark' : 'Light'} mode
        </Button>
        <Button variant={'ghost'} leftIcon={<FiLogOut color={'white'}/>} justifyContent={"start"} gap={1}
                color={'white'}
                _hover={{bg: 'bg3'}}
                onClick={() => {
                  router.push('/auth/login')
                    .then(() => {
                      dispatch(setUser(undefined))
                      dispatch(setToken(undefined))
                    })
                }}>
          Log out
        </Button>
      </Stack>
    </Stack>
  )
}

export default Menu
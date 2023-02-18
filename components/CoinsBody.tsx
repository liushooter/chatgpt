import {
  Button,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const CoinsBody = () => {
  const fontColor = useColorModeValue('fontColor1', 'fontColor2')

  return (
    <Stack spacing={3} minH={'300px'}>
      <SimpleGrid columns={[2, null, 3]} spacing={3}>
        {[3, 6, 12, 30, 50, 98].map((item) => (
          <Button key={item} w={['full', 'full', '120px']} variant={'outline'} _hover={{boxShadow: 'md'}}>
            {item} Coins
          </Button>
        ))}
      </SimpleGrid>
      <Text fontSize={'xs'} color={fontColor}>
        Tips: recharge is valid forever.
      </Text>
      <Spacer/>
      <Text fontSize={'sm'} color={fontColor}>My balance: 1000 Coins</Text>
    </Stack>
  )
}

export default CoinsBody
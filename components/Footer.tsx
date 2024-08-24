import { Center } from "@chakra-ui/react";

const currentDate = new Date();

// Get the current year from the Date object
const currentYear = currentDate.getFullYear();

const Footer = () => {
    return (
        <Center color={'white'} py={1} fontSize={'xs'} fontWeight="medium">7K {currentYear}</Center>
    )
}

export default Footer
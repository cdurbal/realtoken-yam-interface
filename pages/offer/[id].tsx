import { Flex, Text, createStyles, Skeleton, ActionIcon, Title, Divider, useMantineTheme } from "@mantine/core";
import { IconExternalLink, IconShoppingCart } from "@tabler/icons";
import { useRouter } from "next/router"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next";
import { OfferText } from "src/components/Offer/OfferText";
import { useOffer } from "src/hooks/offers/useOffer";
import { usePropertiesToken } from "src/hooks/usePropertiesToken";
import { PropertiesToken } from "src/types";
import { useModals } from '@mantine/modals';
import { useWeb3React } from "@web3-react/core";
import { Offer } from "src/types/offer";
import { useRefreshOffers } from "src/hooks/offers/useRefreshOffers";
import BigNumber from "bignumber.js";
import { PropertyImage } from "src/components/Offer/Image/PropertyImage";
import { openInNewTab } from "src/utils/window";
import { OfferDeltaTable } from "src/components/Table/OfferDeltaTable/OfferDeltaTable";
import { PropertyCard } from "src/components/Offer/PropertyCard";
import { ConnectedProvider } from "src/providers/ConnectProvider";

const useStyle = createStyles((theme) => ({
    container: {
        alignItems: "start",
        width: "50%"
    },
    propertyInfosContainer: {
        display: "flex",
        borderStyle: "solid",
        borderWidth: "3px",
        borderColor: theme.colors.brand,
        borderRadius: theme.radius.md,
        padding: theme.radius.lg,
        gap: theme.spacing.md
    },
    offerId: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.brand,
        borderRadius: theme.radius.md,
        height: "40px",
        padding: `0 ${10}px`,
        // color: theme.colors.brand,
        fontWeight: 700,
        fontSize: theme.fontSizes.xl
    },
    buyButton: {
        width: "125px",
        height: "50px"
    },
    propertyNameContainer: {
        display: "flex",
        justifyContent: "start",
        marginBottom: theme.spacing.sm
    },
    propertyName: {
        borderBottomStyle: "solid",
        borderBottomWidth: "2px",
        borderBottomColor: "transparent",
        '&:hover': {
            borderBottomColor: theme.colors.brand,
            cursor: "pointer"
        },
    }
}));

const ShowOfferPage: FC = () => {

    const { classes } = useStyle();

    const router = useRouter();
    const { id } = router.query;

    const offerId: number = parseInt(id as string);

    const { account } = useWeb3React();
    const { offer, isLoading } = useOffer(offerId);

    const { refreshOffers } = useRefreshOffers(false);

    const { t } = useTranslation('modals', { keyPrefix: 'buy' });
    const { t: t2 } = useTranslation('modals');

    const modals = useModals();

    const [propertyTokens,setPropertyTokens] = useState<PropertiesToken[]>([]);
    const { getPropertyToken, propertiesIsloading } = usePropertiesToken();

    console.log(propertyTokens)

    useEffect(() => {
        if(!offer || propertiesIsloading || propertyTokens.length > 0) return undefined;

        if(offer.buyerTokenType == 1){
            const token = getPropertyToken(offer.buyerTokenAddress);
            if(token) setPropertyTokens(prev => [...prev,token])
        }

        if(offer.offerTokenType == 1){
            const token = getPropertyToken(offer.offerTokenAddress);
            if(token) setPropertyTokens(prev => [...prev,token])
        }

    },[getPropertyToken, offer, propertiesIsloading, propertyTokens.length]);

    const onOpenWalletModal = useCallback(() => {
        modals.openContextModal('wallet', {
          title: <Title order={3}>{t2('wallet.title')}</Title>,
          innerProps: {},
        });
      }, [modals, t2]);
    
    const isAccountOffer: boolean = useMemo(() => {
    if(!offer || !account) return false;
    return offer.sellerAddress == account.toLowerCase()
    },[offer, account])

    const onOpenBuyModal = useCallback(
        (offer: Offer) => {
          modals.openContextModal('buyPermit', {
            title: <Title order={3}>{t2('buy.title')}</Title>,
            size: "lg",
            innerProps: {
              offer: offer,
              triggerTableRefresh: refreshOffers,
            },
        });
    },[modals, refreshOffers, t2]);

    return(
        <ConnectedProvider>
            <Flex direction={"column"} mt={"xl"}>
            { 
                isLoading || offer !== undefined ? (
                    <Flex gap={"md"}>
                        <Flex className={classes.container} direction={"column"} gap={"md"}>
                            <div className={classes.offerId}>
                                {offerId}
                            </div>
                            <Flex direction={"column"} gap={"md"}>
                                <OfferText
                                    title={t("offerTokenName")}
                                    value={offer?.offerTokenName}
                                />
                                <OfferText
                                    title={t("buyerTokenName")}
                                    value={offer?.buyerTokenName}
                                />
                                <OfferText
                                    title={t("sellerAddress")}
                                    value={offer?.sellerAddress}
                                />
                                <OfferText
                                    title={t("amount")}
                                    value={offer?.amount}
                                />
                                <Flex direction={"column"} gap={3}>
                                    <Text fw={700}>{"Price"}</Text>
                                    {   offer?.offerTokenName &&  offer.buyerTokenName && offer?.price ? 
                                            <Text>{`1 "${offer?.offerTokenName}" = ${offer?.price} "${offer.buyerTokenName}"`}</Text>
                                        : 
                                            <Skeleton height={25} width={400}/> 
                                    }
                                    {   offer?.offerTokenName &&  offer.buyerTokenName && offer?.price ? 
                                            <Text>{`1 "${offer.buyerTokenName}" = ${new BigNumber(1).dividedBy(offer?.price).toFixed(5)} ${offer?.offerTokenName}`}</Text>
                                        : 
                                            <Skeleton height={25} width={400}/> 
                                    }
                                </Flex>
                            </Flex>
                            <Divider />
                            <ActionIcon
                                color={'green'}
                                disabled={isAccountOffer}
                                className={classes.buyButton}
                                onClick={() => account && offer ? onOpenBuyModal(offer) : onOpenWalletModal() }
                            >
                                { isAccountOffer ? 
                                    <Text fz={"sm"} align={"center"} p={6}>{"Cannot buy your own offer"}</Text> 
                                    : 
                                    <IconShoppingCart size={24} aria-label={'Buy'} /> 
                                }
                            </ActionIcon>
                        </Flex>
                        <Flex direction={"column"} gap={"md"} align={"center"}>
                        { propertyTokens && offer && propertyTokens.length > 0 ? 
                            propertyTokens.map(token => <PropertyCard key={token.contractAddress} propertyToken={token} offer={offer}/>)
                            :
                            undefined
                        }
                        </Flex>
                    </Flex>
                )
                :
                (
                    <div>{"Offer doesn't exist :/"}</div>
                )
            }
            </Flex>
        </ConnectedProvider>
    )
}

export default ShowOfferPage;
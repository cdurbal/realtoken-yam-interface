import { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionIcon, Group, Title } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { IconEdit, IconShoppingCart } from '@tabler/icons';
import { useWeb3React } from '@web3-react/core';

import { BigNumber } from 'bignumber.js';

import { Offer } from 'src/hooks/types';

type UpdateActions = {
  updateOffer: Offer;
  triggerRefresh: Dispatch<SetStateAction<boolean>>;
};

export const UpdateActions: FC<UpdateActions> = ({
  updateOffer,
  triggerRefresh,
}) => {
  const { account } = useWeb3React();
  const modals = useModals();

  const { t } = useTranslation('modals');

  const onOpenUpdateModal = useCallback(
    (offer: Offer) => {
      modals.openContextModal('update', {
        title: <Title order={3}>{t('update.title')}</Title>,
        innerProps: {
          offerId: offer.offerId,
          price: offer.price,
          amount: offer.amount,
          offerTokenAddress: offer.offerTokenAddress,
          offerTokenDecimals: offer.offerTokenDecimals,
          buyerTokenAddress: offer.buyerTokenAddress,
          buyerTokenDecimals: offer.buyerTokenDecimals,
          triggerTableRefresh: triggerRefresh,
        },
      });
    },
    [modals, triggerRefresh, t]
  );

  const onOpenWalletModal = useCallback(() => {
    modals.openContextModal('wallet', {
      title: <Title order={3}>{t('wallet.title')}</Title>,
      innerProps: {},
    });
  }, [modals, t]);

  return (
    <Group position={'center'}>
      {
        <ActionIcon
          color={'green'}
          onClick={() =>
            account ? onOpenUpdateModal(updateOffer) : onOpenWalletModal()
          }
        >
          <IconEdit size={16} />
        </ActionIcon>
      }
    </Group>
  );
};

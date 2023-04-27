import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Group,
  Image,
  MediaQuery,
  Text,
  Title,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import { NextLink } from '@mantine/next';
import { useWeb3React } from '@web3-react/core';
import { Logo } from 'src/assets';
import { Divider } from '../Divider';
import { SettingsMenu } from '../SettingsMenu';
import { WalletMenu } from '../WalletMenu';
import { NetworkMenu } from '../NetworkMenu';
import { MessageNetwork } from '../ChainSelect'
import { styles } from './Header.styles';
import { useRouter } from 'next/router';
import { useRole } from 'src/hooks/useRole';
import { isRole, USER_ROLE } from 'src/types/admin';

const LogoWithName: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'header' });

  return (
    <Group align={'center'} spacing={'xs'}>
      <Image src={Logo.src} alt={'RealT Logo'} width={36} />
      <MediaQuery smallerThan={'xs'} styles={{ display: 'none' }}>
        <Title order={3}>{t('title')}</Title>
      </MediaQuery>
    </Group>
  );
};

const ConnectButton: FC = () => {
  const modals = useModals();

  const { t } = useTranslation('modals', { keyPrefix: 'wallet' });

  const onOpenWalletModal = useCallback(() => {
    modals.openContextModal('wallet', {
      title: <Title order={3}>{t('title')}</Title>,
      innerProps: {},
    });
  }, [modals, t]);

  return (
    <Button aria-label={t('title')} onClick={onOpenWalletModal}>
      {t('title')}
    </Button>
  );
};

const HeaderButtons: FC = () => {
  const { account } = useWeb3React();

  return (
    <Group spacing={10}>
      <NetworkMenu />
      {account ? <WalletMenu /> : <ConnectButton />}
      <SettingsMenu />
    </Group>
  );
};

export const Header: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'header' });
  const router = useRouter()
  const colorSelected = '#cfaa70';

  const { role } = useRole();

  return (
    <div>
      <MessageNetwork classeName={styles.message}></MessageNetwork>
      <Box sx={styles.container}>
        <Group position={'apart'} align={'center'}>
          <LogoWithName />
          <Text
            size={'xl'}
            weight={700}
            component={NextLink}
            href={'/'}
            color={router.pathname === '/' ? colorSelected : ''}
          >
            {t('titleCat1')}
          </Text>
          <Text
            size={'xl'}
            weight={700}
            component={NextLink}
            href={'/my-offers'}
            color={router.pathname === '/my-offers' ? colorSelected : ''}
          >
            {t('titleCat2')}
          </Text>
          {isRole(role, [USER_ROLE.MODERATOR, USER_ROLE.ADMIN]) ?
            <Text
              size={'xl'}
              weight={700}
              component={NextLink}
              href={'/admin'}
              color={router.pathname === '/admin' ? colorSelected : ''}
            >
              {t('titleAdmin')}
            </Text>
            :
            undefined
          }
          <HeaderButtons />
        </Group>
      </Box>
      <Divider />
    </div>
  );
};

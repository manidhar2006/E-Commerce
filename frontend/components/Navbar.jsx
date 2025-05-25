import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const getButtonStyles = (path) => {
        return {
            color: pathname === path ? 'white' : 'inherit',
            backgroundColor: pathname === path ? 'secondary.main' : 'transparent',
            padding: '8px 16px',
            borderRadius: '8px',
            '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                transform: 'scale(1.05)',
            },
            transition: 'background-color 0.3s, transform 0.2s',
        };
    };

    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    BUY SELL AND RENT @ IIITH
                </Typography>
                <Button
                    sx={getButtonStyles('/products')}
                    onClick={() => router.push('/products')}
                >
                    Products
                </Button>
                <Button
                    sx={getButtonStyles('/orders-history')}
                    onClick={() => router.push('/orders-history')}
                >
                    Order History
                </Button>
                <Button
                    sx={getButtonStyles('/delivery')}
                    onClick={() => router.push('/delivery')}
                >
                   Pending Deliveries
                </Button>
                <Button
                    sx={getButtonStyles('/cart')}
                    onClick={() => router.push('/cart')}
                >
                    Cart
                </Button>
                <Button
                    sx={getButtonStyles('/profile')}
                    onClick={() => router.push('/profile')}
                >
                    Profile
                </Button>
                <Button
                    sx={getButtonStyles('/additem')}
                    onClick={() => router.push('/additem')}
                >
                    Add Item
                </Button>
                <Button
                    sx={getButtonStyles('/support')}
                    onClick={() => router.push('/support')}
                >
                    Support
                </Button>
                <Button
                    sx={getButtonStyles('/logout')}
                    onClick={() => router.push('/logout')}
                >
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}

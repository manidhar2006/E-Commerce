import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function Footer() {
    return (
        <Box 
            component="footer" 
            sx={{
                backgroundColor: 'primary.main', 
                color: 'white', 
                py: 3, 
                mt: 'auto',
                position: 'relative',
                bottom: 0,
                width: '100%',
            }}
        >
            <Container>
                <Typography variant="body1" align="center">
                    &copy; .BUY SELL AND RENT @ IIITH All rights reserved.
                </Typography>
                <Typography variant="body2" align="center">
                    Designed with ❤️ by My Company
                </Typography>
            </Container>
        </Box>
    );
}

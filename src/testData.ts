// Test message containing various content types to validate
export const TEST_MESSAGE = `
[phone]

Allow:
1) 123-123
2) 12-12
3) 1234-123
4) 123-1234-12
5) 1-1-1
6) 1234~123~1234
7) 1234~1234~1234
8) 123~1234~1234
9) 1234 ~ 1234
10) from 1234 til 1234 so
11) hello12-12-1234
12) Our children are 11, 13, 13, 14 and 16.
13) 2023-12-12

Block: (only when booking is not confirmed)
1) 1234-1234
2) 123-123-12345
3) 12345 12345 1234
4) +81 123-123-1234
5) 123 1234 1234
6) 123 123 1234

[email]

Allow:
1) supplier@gowithguide.com
2) contact@travelience.co.jp

Block:
1) customer@gmail.com
2) customer@hotmail.com
3) customer@hotmail.co.jp


[link]

Allow:
1) https://gowithguide.com/japan/fukuoka/guides?calendar=2018-06-30
2) gowithguide.com/japan/fukuoka/guides?calendar=2018-06-30
3) https://us06web.zoom.us/j/85721293828
4) zoom.us/j/85721293828

Block:
1) https://en.wikipedia.org/wiki/Asakusa
2) wikipedia.org/wiki/Asakusa
3) https://www.bbc.com/news/world-asia-38088036
4) https://www.navitime.co.jp/poi?spt=02022.1132039
5) bbc.com/news/world-asia-38088036
6) www.navitime.co.jp/poi?spt=02022.1132039

[keywords]
Allow:
1) tours by locals
2) instagra
3) tweet
4) gowithguide
5) zoom.us

Block:
1) tourhq
2) toursbylocals
3) withlocals
4) facebook
5) twitter
6) instagram
7) gmail
8) email
9) skype
`;

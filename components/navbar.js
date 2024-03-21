import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <div className="ml-10 flex items-baseline space-x-20">
                                <Link href="/">
                                    Home
                                </Link>
                                <Link href="/elasticSearch">
                                    Elastic Search
                                </Link>
                                <Link href="/history">
                                    History
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
